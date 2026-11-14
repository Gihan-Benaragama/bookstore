using Bookstore.Api.DTOs.Books;
using Bookstore.Api.DTOs.Common;

namespace Bookstore.Api.Services.Interfaces;

public interface IBookService
{
    Task<PagedResult<BookDto>> GetBooksAsync(BookQueryParams query);
    Task<BookDto?> GetBookByIdAsync(int id);
    Task<BookDto> CreateBookAsync(CreateBookDto dto);
    Task<BookDto?> UpdateBookAsync(int id, UpdateBookDto dto);
    Task<bool> DeleteBookAsync(int id);
}

