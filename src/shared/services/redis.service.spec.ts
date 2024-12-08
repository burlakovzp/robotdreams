import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { createClient } from 'redis';

jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    on: jest.fn(),
    connect: jest.fn(),
  }),
}));

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a Redis client on instantiation', () => {
    expect(createClient).toHaveBeenCalledWith({
      url: 'redis://localhost:6379',
    });
  });

  it('should set up error handling for the Redis client', () => {
    const mockClient = createClient();
    expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('should connect the Redis client', () => {
    const mockClient = createClient();
    expect(mockClient.connect).toHaveBeenCalled();
  });
});
