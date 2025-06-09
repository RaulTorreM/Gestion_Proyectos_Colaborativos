const User = require('../../../models/User');
const bcrypt = require('bcrypt');
const { mockHelpers } = require('../../setup/mocks');

jest.mock('bcrypt', () => ({
  hash: jest.fn((password, salt) => Promise.resolve(`hashed_${password}`))
}));

describe('PUT /api/users/:id', () => {
  beforeEach(() => {
    mockHelpers.resetMocks();
    jest.clearAllMocks();
  });

  test('should update user successfully without password', async () => {
    const userId = 'user123';
    const updateData = { name: 'Updated Name', email: 'updated@email.com' };

    const mockUpdatedUser = {
      _id: userId,
      name: 'Updated Name',
      email: 'updated@email.com',
      avatar: 'default_avatar.png',
      password: 'hashed_old_password',
      toObject: jest.fn().mockReturnValue({
        _id: userId,
        name: 'Updated Name',
        email: 'updated@email.com',
        avatar: 'default_avatar.png',
      }),
    };

    mockHelpers.setupUpdateMock(mockUpdatedUser);

    const response = await global.request
      .put(`/api/users/${userId}`)
      .set('Authorization', 'valid_token')
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User Updated');
    expect(response.body.data).toHaveProperty('_id', userId);
    expect(response.body.data).toHaveProperty('name', 'Updated Name');
    expect(response.body.data).toHaveProperty('email', 'updated@email.com');
    expect(response.body.data).not.toHaveProperty('password');

    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  test('should update user with hashed password', async () => {
    const userId = 'user123';
    const updateData = {
      name: 'Updated Name',
      email: 'updated@email.com',
      password: 'newpassword123'
    };

    const mockUpdatedUser = {
      _id: userId,
      name: 'Updated Name',
      email: 'updated@email.com',
      password: 'hashed_newpassword123',
      toObject: jest.fn().mockReturnValue({
        _id: userId,
        name: 'Updated Name',
        email: 'updated@email.com',
      }),
    };

    mockHelpers.setupUpdateMock(mockUpdatedUser);

    const response = await global.request
      .put(`/api/users/${userId}`)
      .set('Authorization', 'valid_token')
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User Updated');
    expect(response.body.data).toHaveProperty('_id', userId);
    expect(response.body.data).not.toHaveProperty('password');

    expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        name: 'Updated Name',
        email: 'updated@email.com',
        password: 'hashed_newpassword123',
      }),
      { new: true }
    );
  });

  test('should return 404 when user not found', async () => {
    const userId = 'nonexistent123';
    const updateData = { name: 'Updated Name' };

    mockHelpers.setupUpdateMock(null);

    const response = await global.request
      .put(`/api/users/${userId}`)
      .set('Authorization', 'valid_token')
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  test('should assign default avatar when avatar is null', async () => {
    const userId = 'user123';
    const updateData = { name: 'Updated Name', avatar: null };

    const mockUpdatedUser = {
      _id: userId,
      name: 'Updated Name',
      avatar: 'default_avatar.png',
      toObject: jest.fn().mockReturnValue({
        _id: userId,
        name: 'Updated Name',
        avatar: 'default_avatar.png'
      }),
    };

    mockHelpers.setupUpdateMock(mockUpdatedUser);

    const response = await global.request
      .put(`/api/users/${userId}`)
      .set('Authorization', 'valid_token')
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('avatar', 'default_avatar.png');
  });
});
