import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {AppService} from "./app.service";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    await app.listen(3000, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);

    // Standalone service

    const service = app.get(AppService);
    // const fileName = await service.getLiteForexData();
    const fileName = 'copying_data_04_04_2020.html';
    // const fileName = 'copying_body.html';
    await service.extractDataFile(fileName);
}

bootstrap().then();
