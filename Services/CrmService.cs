using CrmSystem.Data;
using CrmSystem.DTOs;
using CrmSystem.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Xml.Schema;

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
            DateTask = dto.DateTask
        };

        await _context.AddAsync(newDeal, ct);
        await _context.SaveChangesAsync(ct);

        return newDeal;
    }

    public async Task<IEnumerable<DealRecord>> GetAllDealsAsync(CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        var deals = _context.Deals;

        return await deals.ToListAsync(ct);
    }

    public async Task<DealRecord?> GetDealByIdAsync(int Id, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        return await _context.Deals.FindAsync(Id, ct);
    }

    public async Task <DealRecord?> UpdateDealAsync (int id, CreateNewDealRecordDto dto, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        var existing = await _context.Deals.FirstOrDefaultAsync(d => d.Id == id, ct);
        if (existing == null) return null;
        
        existing.CustomersName = dto.CustomersName;
        existing.CustomersPhoneNumber = dto.CustomersPhoneNumber;
        existing.Location = dto.Location;
        existing.Description = dto.Description;
        existing.DateTask = dto.DateTask;

        await _context.SaveChangesAsync(ct);
        return existing;
    }

    public async Task<bool> DeleteDealAsync(int id, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        var deal = await _context.Deals.FirstOrDefaultAsync(ct);
        if (deal == null) return false;

        _context.Deals.Remove(deal);
        await _context.SaveChangesAsync(ct);
        return true;
    }
}