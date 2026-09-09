using CrmSystem.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CrmSystem.Data;

public class AppDbContext : DbContext
{
     public AppDbContext(DbContextOptions<AppDbContext>options) : base(options){}

    /// <summary>
    /// Таблица в базе данных
    /// </summary>
    public DbSet<DealRecord> Deals {get; set;} = null!;

    //Настройка схемы
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<DealRecord>( entity => 
           { 
            entity.Property(e => e.CustomersName)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.CustomersPhoneNumber)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.Location)
                .HasMaxLength(200);

            entity.Property(e => e.Description)
                .HasMaxLength(300);
        
            }
        );
    } 
}