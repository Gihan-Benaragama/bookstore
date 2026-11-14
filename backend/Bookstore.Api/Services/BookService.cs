using Bookstore.Api.Data;
using Bookstore.Api.DTOs.Books;
using Bookstore.Api.DTOs.Common;
using Bookstore.Api.Entities;
using Bookstore.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Bookstore.Api.Services;

public class BookService(AppDbContext db) : IBookService
{
    public async Task<PagedResult<BookDto>> GetBooksAsync(BookQueryParams q)
    {
        var query = db.Books
            .Include(b => b.Author)
            .Include(b => b.Category)
            .AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var term = q.Search.ToLower();
            query = query.Where(b =>
                b.Title.ToLower().Contains(term) ||
                b.ISBN.ToLower().Contains(term) ||
                b.Author.FirstName.ToLower().Contains(term) ||
                b.Author.LastName.ToLower().Contains(term));
        }

        // Filters
        if (q.CategoryId.HasValue)
            query = query.Where(b => b.CategoryId == q.CategoryId);

        if (q.AuthorId.HasValue)
            query = query.Where(b => b.AuthorId == q.AuthorId);

        if (q.MinPrice.HasValue)
            query = query.Where(b => b.Price >= q.MinPrice);

        if (q.MaxPrice.HasValue)
            query = query.Where(b => b.Price <= q.MaxPrice);

        // Sort
        query = (q.SortBy.ToLower(), q.SortOrder.ToLower()) switch
        {
            ("price", "desc")          => query.OrderByDescending(b => b.Price),
            ("price", _)               => query.OrderBy(b => b.Price),
            ("publisheddate", "desc")  => query.OrderByDescending(b => b.PublishedDate),
            ("publisheddate", _)       => query.OrderBy(b => b.PublishedDate),
            (_, "desc")                => query.OrderByDescending(b => b.Title),
            _                          => query.OrderBy(b => b.Title)
        };

        var total = await query.CountAsync();

        var page = Math.Max(1, q.Page);
        var pageSize = Math.Clamp(q.PageSize, 1, 100);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => ToDto(b))
            .ToListAsync();

        return new PagedResult<BookDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<BookDto?> GetBookByIdAsync(int id)
    {
        var book = await db.Books
            .Include(b => b.Author)
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id);

        return book is null ? null : ToDto(book);
    }

    public async Task<BookDto> CreateBookAsync(CreateBookDto dto)
    {
        var book = new Book
        {
            Title = dto.Title,
            ISBN = dto.ISBN,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            CoverImageUrl = dto.CoverImageUrl,
            PublishedDate = dto.PublishedDate,
            AuthorId = dto.AuthorId,
            CategoryId = dto.CategoryId
        };

        db.Books.Add(book);
        await db.SaveChangesAsync();

        await db.Entry(book).Reference(b => b.Author).LoadAsync();
        await db.Entry(book).Reference(b => b.Category).LoadAsync();

        return ToDto(book);
    }

    public async Task<BookDto?> UpdateBookAsync(int id, UpdateBookDto dto)
    {
        var book = await db.Books
            .Include(b => b.Author)
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book is null) return null;

        book.Title = dto.Title;
        book.ISBN = dto.ISBN;
        book.Description = dto.Description;
        book.Price = dto.Price;
        book.Stock = dto.Stock;
        book.CoverImageUrl = dto.CoverImageUrl;
        book.PublishedDate = dto.PublishedDate;
        book.AuthorId = dto.AuthorId;
        book.CategoryId = dto.CategoryId;

        await db.SaveChangesAsync();

        await db.Entry(book).Reference(b => b.Author).LoadAsync();
        await db.Entry(book).Reference(b => b.Category).LoadAsync();

        return ToDto(book);
    }

    public async Task<bool> DeleteBookAsync(int id)
    {
        var book = await db.Books.FindAsync(id);
        if (book is null) return false;

        db.Books.Remove(book);
        await db.SaveChangesAsync();
        return true;
    }

    private static BookDto ToDto(Book b) => new()
    {
        Id = b.Id,
        Title = b.Title,
        ISBN = b.ISBN,
        Description = b.Description,
        Price = b.Price,
        Stock = b.Stock,
        CoverImageUrl = b.CoverImageUrl,
        PublishedDate = b.PublishedDate,
        AuthorId = b.AuthorId,
        AuthorName = $"{b.Author.FirstName} {b.Author.LastName}",
        CategoryId = b.CategoryId,
        CategoryName = b.Category.Name
    };
}

