-- ============================================================================
-- Migration 2: ADD COLUMNS
-- Tip operacije: ADD COLUMN (ALTER TABLE ... ADD)
-- Dodavanje novih kolona za proširenje funkcionalnosti
-- ============================================================================

BEGIN TRY

BEGIN TRAN;

-- ============================================================================
-- AddColumn: Project.description
-- Dodajemo opis projekta koji nije bio u inicijalnoj verziji
-- ============================================================================
ALTER TABLE [dbo].[Project] ADD [description] NVARCHAR(max) NULL;

-- ============================================================================
-- AddColumn: Project.color
-- Dodajemo boju projekta za vizuelno razlikovanje
-- ============================================================================
ALTER TABLE [dbo].[Project] ADD [color] NVARCHAR(7) NOT NULL
    CONSTRAINT [Project_color_df] DEFAULT '#6366f1';

-- ============================================================================
-- AddColumn: Column.position
-- Dodajemo poziciju kolone za sortiranje
-- ============================================================================
ALTER TABLE [dbo].[Column] ADD [position] INT NOT NULL
    CONSTRAINT [Column_position_df] DEFAULT 0;

-- ============================================================================
-- AddColumn: Column.color
-- Dodajemo boju kolone za vizuelno razlikovanje
-- ============================================================================
ALTER TABLE [dbo].[Column] ADD [color] NVARCHAR(7) NOT NULL
    CONSTRAINT [Column_color_df] DEFAULT '#6b7280';

-- ============================================================================
-- AddColumn: Task.description
-- Dodajemo detaljan opis taska
-- ============================================================================
ALTER TABLE [dbo].[Task] ADD [description] NVARCHAR(max) NULL;

-- ============================================================================
-- AddColumn: Task.position
-- Dodajemo poziciju taska unutar kolone
-- ============================================================================
ALTER TABLE [dbo].[Task] ADD [position] INT NOT NULL
    CONSTRAINT [Task_position_df] DEFAULT 0;

-- ============================================================================
-- AddColumn: Task.priority
-- Dodajemo prioritet taska (LOW, MEDIUM, HIGH, URGENT)
-- ============================================================================
ALTER TABLE [dbo].[Task] ADD [priority] NVARCHAR(16) NOT NULL
    CONSTRAINT [Task_priority_df] DEFAULT 'MEDIUM';

-- ============================================================================
-- AddColumn: Task.dueDate
-- Dodajemo rok za završetak taska
-- ============================================================================
ALTER TABLE [dbo].[Task] ADD [dueDate] DATETIME2 NULL;

-- ============================================================================
-- AddColumn: Task.assigneeId
-- Dodajemo mogućnost dodele taska korisniku
-- ============================================================================
ALTER TABLE [dbo].[Task] ADD [assigneeId] INT NULL;

-- ============================================================================
-- AddColumn: Task.labelId
-- Dodajemo mogućnost kategorizacije taska
-- ============================================================================
ALTER TABLE [dbo].[Task] ADD [labelId] INT NULL;

-- ============================================================================
-- AddColumn: Label.color
-- Dodajemo boju labele za vizuelno razlikovanje
-- ============================================================================
ALTER TABLE [dbo].[Label] ADD [color] NVARCHAR(7) NOT NULL
    CONSTRAINT [Label_color_df] DEFAULT '#6b7280';

-- ============================================================================
-- AddColumn: Notification.link
-- Dodajemo link za direktan pristup relevantnom sadržaju
-- ============================================================================
ALTER TABLE [dbo].[Notification] ADD [link] NVARCHAR(255) NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
