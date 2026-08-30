using CrmSystem.Data;
using CrmSystem.DTOs;
using CrmSystem.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace CrmSystem.Services;

public class CrmService : ICrmService
{
    private readonly AppDbContext _context;

    public CrmService(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<DealRecord> CreateDealAsync(CreateNewDealRecordDto dto, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        var newDeal = new DealRecord
        {
            CustomersName = dto.CustomersName,
            CustomersPhoneNumber = dto.CustomersPhoneNumber,
            Location = dto.Location,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow,
            NextCall = dto.NextCall
        };

        await _context.AddAsync(newDeal, ct);
        await _context.SaveChangesAsync(ct);

        return newDeal;
    }

    public async Task<IEnumerable<DealRecord>> GetAllDealsAsync(CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        var deals = _context.Deals;

        return deals;
    }

    public async Task<DealRecord?> GetDealByIdAsync(int Id, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        return await _context.Deals.FindAsync(Id, ct);
    }
}