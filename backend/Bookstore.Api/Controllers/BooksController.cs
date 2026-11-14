using Bookstore.Api.DTOs.Books;
using Bookstore.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bookstore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController(IBookService bookService) : ControllerBase
{
    /// <summary>Get all books with search, filter, sort and pagination.</summary>
    [HttpGet]
    public async Task<IActionResult> GetBooks([FromQuery] BookQueryParams query)
    {
        var result = await bookService.GetBooksAsync(query);
        return Ok(result);
    }

    /// <summary>Get a single book by ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBook(int id)
    {
        var book = await bookService.GetBookByIdAsync(id);
        return book is null ? NotFound() : Ok(book);
    }

    /// <summary>Create a new book. Admin only.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateBook(CreateBookDto dto)
    {
        var book = await bookService.CreateBookAsync(dto);
        return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
    }

    /// <summary>Update an existing book. Admin only.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateBook(int id, UpdateBookDto dto)
    {
        var book = await bookService.UpdateBookAsync(id, dto);
        return book is null ? NotFound() : Ok(book);
    }

    /// <summary>Delete a book. Admin only.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var success = await bookService.DeleteBookAsync(id);
        return success ? NoContent() : NotFound();
    }
}

