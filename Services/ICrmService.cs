using CrmSystem.Models;
using CrmSystem.DTOs;

namespace CrmSystem.Services;

public interface ICrmService{
    Task<DealRecord> CreateDealAsync(CreateNewDealRecordDto dto, CancellationToken ct);

    //Task<DealRecord> UpdateDealAsync(int id, CreateNewDealRecordDto dto, CancellationToken ct);

    //Task<bool> DeleteDealAsync(int id, CancellationToken ct);

    Task<IEnumerable<DealRecord>> GetAllDealsAsync(CancellationToken ct);

    Task<DealRecord?> GetDealByIdAsync(int id, CancellationToken ct);
}