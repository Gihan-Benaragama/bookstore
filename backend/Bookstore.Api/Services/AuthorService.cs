using Bookstore.Api.Data;
using Bookstore.Api.DTOs.Authors;
using Bookstore.Api.Entities;
using Bookstore.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookstore.Api.Services;

public class AuthorService(AppDbContext db) : IAuthorService
{
    public async Task<List<AuthorDto>> GetAllAsync() =>
        await db.Authors
            .OrderBy(a => a.LastName)
            .Select(a => ToDto(a))
            .ToListAsync();

    public async Task<AuthorDto?> GetByIdAsync(int id)
    {
        var author = await db.Authors.FindAsync(id);
        return author is null ? null : ToDto(author);
    }

    public async Task<AuthorDto> CreateAsync(CreateAuthorDto dto)
    {
        var author = new Author
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Bio = dto.Bio
        };
        db.Authors.Add(author);
        await db.SaveChangesAsync();
        return ToDto(author);
    }

    public async Task<AuthorDto?> UpdateAsync(int id, UpdateAuthorDto dto)
    {
        var author = await db.Authors.FindAsync(id);
        if (author is null) return null;

        author.FirstName = dto.FirstName;
        author.LastName = dto.LastName;
        author.Bio = dto.Bio;

        await db.SaveChangesAsync();
        return ToDto(author);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var author = await db.Authors.FindAsync(id);
        if (author is null) return false;

        db.Authors.Remove(author);
        await db.SaveChangesAsync();
        return true;
    }

    private static AuthorDto ToDto(Author a) => new()
    {
        Id = a.Id,
        FirstName = a.FirstName,
        LastName = a.LastName,
        Bio = a.Bio
    };
}

