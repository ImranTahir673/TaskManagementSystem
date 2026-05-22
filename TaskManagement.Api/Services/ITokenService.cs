using TaskManagement.Api.Models;

namespace TaskManagement.Api.Services;

public interface ITokenService
{
    (string token, DateTime expiresAtUtc) GenerateToken(User user);
}