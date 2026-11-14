using Bookstore.Api.DTOs.Authors;

namespace Bookstore.Api.Services.Interfaces;

public interface IAuthorService
{
    Task<List<AuthorDto>> GetAllAsync();
    Task<AuthorDto?> GetByIdAsync(int id);
    Task<AuthorDto> CreateAsync(CreateAuthorDto dto);
    Task<AuthorDto?> UpdateAsync(int id, UpdateAuthorDto dto);
    Task<bool> DeleteAsync(int id);
}

