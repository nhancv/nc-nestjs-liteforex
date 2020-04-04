import {Injectable} from '@nestjs/common';
import request from "request-promise-native";
import moment from "moment";
import * as fs from 'fs';
import * as xl from 'excel4node';
import * as path from "path";
import cheerio from 'cheerio';
import {AppConfig} from "./app.config";
import * as Store from 'data-store';

@Injectable()
export class AppService {

    constructor(private readonly appConfig: AppConfig) {}

    getHello(): string {
        return 'Hello World!';
    }

    async getLiteForexData(): Promise<string> {
        const response = await request({
            method: 'GET',
            url: 'https://my.liteforex.com/profile/copiers',
            headers: {
                'Cookie': process.env.LITEFOREX_COOKIE
            }
        });
        const outputName = `copying_data_${moment.utc().utcOffset("+0700").format("DD_MM_YYYY")}.html`;
        const outputFile = `${process.cwd()}/logs/${outputName}`;
        try {
            fs.writeFileSync(outputFile, response, 'utf-8');
            console.log(`Write file completed: ${outputName}`);
        } catch (e) {
            console.log(e);
        }
        return outputName;
    }

    async extractDataFile(fileName: string) {
        const data = fs.readFileSync(path.resolve(__dirname, `../logs/${fileName}`), 'utf-8');
        const $ = cheerio.load(data);
        $('.content_row.mix').get().forEach((child, index, array) => {
            console.log({
                account: $(child).attr("data-inv-account"),
                name: $(child).attr("data-inv-name"),
                duration: $(child).attr("data-inv-duration"),
                amount: $(child).attr("data-inv-amount"),
                profit: $(child).attr("data-inv-profit"),
                commission: $(child).attr("data-inv-commission")
            });
        });

        const store: Store = this.appConfig.getAgentStore();
        console.log(store.get('agent_1'));

    }

    async excelGenerateFile(symbol: string, totalv: any[]): Promise<{ file: string, stats: any }> {
        return new Promise((resolve: any, reject) => {
            const wb = new xl.Workbook({defaultFont: {size: 12, name: 'Calibri'}});
            const ws = wb.addWorksheet('Sheet 1');
            const styleGreen = wb.createStyle({font: {color: '#71A61E'}});
            const styleRed = wb.createStyle({font: {color: '#E71271'}});

            ws.column(1).setWidth(7);
            ws.column(2).setWidth(10);
            ws.column(3).setWidth(18);
            ws.column(4).setWidth(16);
            ws.cell(1, 1).string('#');
            ws.cell(1, 2).string('Time');
            ws.cell(1, 3).string('Qty').style({alignment: {horizontal: 'right'}});
            ws.cell(1, 4).string('Price').style({alignment: {horizontal: 'right'}});

            totalv.forEach((v, i) => {
                let style = styleGreen;
                if (v.isBuyerMaker) {
                    style = styleRed;
                }
                const time = moment(v.time).utc().utcOffset("+0700").format("HH:mm:ss");
                ws.cell(i + 2, 1).string((i + 1).toString()).style(style);
                ws.cell(i + 2, 2).string(time).style(style);
                ws.cell(i + 2, 3).string(v.qty).style(style).style({alignment: {horizontal: 'right'}});
                ws.cell(i + 2, 4).string(v.price).style(style).style({alignment: {horizontal: 'right'}});
            });

            const fileName = `${symbol}_${moment().utc().utcOffset("+0700").format("DD_MM")}.xlsx`;
            wb.write(fileName, (err, stats) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({file: fileName, stats: stats});
                }
            });
        });

    }

}
