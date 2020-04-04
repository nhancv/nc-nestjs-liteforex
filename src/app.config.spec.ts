import { Test, TestingModule } from '@nestjs/testing';
import { AppConfig } from './app.config';

describe('AppConfig', () => {
  let provider: AppConfig;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppConfig],
    }).compile();

    provider = module.get<AppConfig>(AppConfig);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
