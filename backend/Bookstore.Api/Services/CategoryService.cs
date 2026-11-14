using Bookstore.Api.Data;
using Bookstore.Api.DTOs.Categories;
using Bookstore.Api.Entities;
using Bookstore.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookstore.Api.Services;

public class CategoryService(AppDbContext db) : ICategoryService
{
    public async Task<List<CategoryDto>> GetAllAsync() =>
        await db.Categories
            .OrderBy(c => c.Name)
            .Select(c => ToDto(c))
            .ToListAsync();

    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var cat = await db.Categories.FindAsync(id);
        return cat is null ? null : ToDto(cat);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        var cat = new Category { Name = dto.Name, Description = dto.Description };
        db.Categories.Add(cat);
        await db.SaveChangesAsync();
        return ToDto(cat);
    }

    public async Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto)
    {
        var cat = await db.Categories.FindAsync(id);
        if (cat is null) return null;

        cat.Name = dto.Name;
        cat.Description = dto.Description;

        await db.SaveChangesAsync();
        return ToDto(cat);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var cat = await db.Categories.FindAsync(id);
        if (cat is null) return false;

        db.Categories.Remove(cat);
        await db.SaveChangesAsync();
        return true;
    }

    private static CategoryDto ToDto(Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Description = c.Description
    };
}

