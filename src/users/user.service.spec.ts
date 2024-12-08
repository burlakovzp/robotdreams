import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all users', async () => {
    const users = [new UserEntity(), new UserEntity()];
    jest.spyOn(repository, 'find').mockResolvedValue(users);

    expect(await service.findAll()).toBe(users);
  });

  it('should find one user by id', async () => {
    const user = new UserEntity();
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);

    expect(await service.findOne(1)).toBe(user);
  });

  it('should remove a user by id', async () => {
    jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

    await service.remove(1);
    expect(repository.delete).toHaveBeenCalledWith(1);
  });

  it('should create a new user', async () => {
    const user = new UserEntity();
    jest.spyOn(repository, 'create').mockReturnValue(user);
    jest.spyOn(repository, 'save').mockResolvedValue(user);

    expect(await service.create(user)).toBe(user);
  });

  it('should find a user by email', async () => {
    const user = new UserEntity();
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(user);

    expect(await service.findByEmail('test@example.com')).toBe(user);
  });
});
