-- ============================================================================
-- Migration 5: OPTIMIZATION AND CLEANUP
-- Tip operacije: DROP INDEX, DROP COLUMN, CREATE INDEX (composite)
-- Optimizacija performansi i čišćenje nepotrebnih elemenata
-- ============================================================================

BEGIN TRY

BEGIN TRAN;

-- ============================================================================
-- DROP INDEX: Uklanjamo jednostavne indekse koje ćemo zameniti kompozitnim
-- Kompozitni indeksi su efikasniji za sortiranje po poziciji
-- ============================================================================

-- Uklanjamo jednostavan index na Column.boardId
DROP INDEX [Column_boardId_idx] ON [dbo].[Column];

-- Uklanjamo jednostavan index na Task.columnId
DROP INDEX [Task_columnId_idx] ON [dbo].[Task];

-- Uklanjamo jednostavan index na Notification.userId
DROP INDEX [Notification_userId_idx] ON [dbo].[Notification];

-- ============================================================================
-- CREATE INDEX: Kompozitni indeksi za bolje performanse
-- Omogućavaju efikasnije sortiranje i filtriranje
-- ============================================================================

-- Kompozitni index: Column po boardId i position (za sortiranje kolona)
CREATE NONCLUSTERED INDEX [Column_boardId_position_idx]
    ON [dbo].[Column]([boardId], [position]);

-- Kompozitni index: Task po columnId i position (za sortiranje taskova)
CREATE NONCLUSTERED INDEX [Task_columnId_position_idx]
    ON [dbo].[Task]([columnId], [position]);

-- Kompozitni index: Notification po userId i isRead (za filtriranje nepročitanih)
CREATE NONCLUSTERED INDEX [Notification_userId_isRead_idx]
    ON [dbo].[Notification]([userId], [isRead]);

-- Kompozitni index: Task po dueDate i priority (za kalendar i prioritetne preglede)
CREATE NONCLUSTERED INDEX [Task_dueDate_priority_idx]
    ON [dbo].[Task]([dueDate], [priority]);

-- ============================================================================
-- DROP COLUMN: Uklanjamo deprecated kolonu (primer)
-- U realnom scenariju, ovo bi bila kolona koja više nije u upotrebi
-- Kreiramo privremenu kolonu pa je uklanjamo kao demonstraciju
-- ============================================================================

-- Dodajemo privremenu kolonu koju ćemo odmah obrisati (za demonstraciju DROP COLUMN)
ALTER TABLE [dbo].[Task] ADD [_deprecated_temp] NVARCHAR(50) NULL;

-- Brišemo privremenu kolonu
ALTER TABLE [dbo].[Task] DROP COLUMN [_deprecated_temp];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
