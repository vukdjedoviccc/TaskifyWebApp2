-- ============================================================================
-- Migration 1: CREATE TABLES
-- Tip operacije: CREATE TABLE
-- Kreiranje svih tabela sa osnovnim kolonama (bez FK, indeksa, dodatnih kolona)
-- ============================================================================

BEGIN TRY

BEGIN TRAN;

-- ============================================================================
-- CreateTable: User
-- Osnovna tabela za korisnike sistema
-- ============================================================================
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(191) NOT NULL,
    [email] NVARCHAR(191) NOT NULL,
    [password] NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(16) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'USER',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- ============================================================================
-- CreateTable: Project
-- Projekti - kontejneri za board-ove
-- ============================================================================
CREATE TABLE [dbo].[Project] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(191) NOT NULL,
    [ownerId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Project_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Project_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- ============================================================================
-- CreateTable: Board
-- Kanban table unutar projekata
-- ============================================================================
CREATE TABLE [dbo].[Board] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(191) NOT NULL,
    [projectId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Board_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Board_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- ============================================================================
-- CreateTable: Column
-- Kolone na Kanban tabli (To Do, In Progress, Done)
-- ============================================================================
CREATE TABLE [dbo].[Column] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(64) NOT NULL,
    [boardId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Column_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Column_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- ============================================================================
-- CreateTable: Task
-- Zadaci/kartice na Kanban tabli
-- ============================================================================
CREATE TABLE [dbo].[Task] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(512) NOT NULL,
    [columnId] INT NOT NULL,
    [createdById] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Task_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Task_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- ============================================================================
-- CreateTable: Label
-- Kategorije/labele za taskove
-- ============================================================================
CREATE TABLE [dbo].[Label] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(64) NOT NULL,
    [projectId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Label_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Label_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- ============================================================================
-- CreateTable: Notification
-- Obaveštenja za korisnike
-- ============================================================================
CREATE TABLE [dbo].[Notification] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [type] NVARCHAR(32) NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [message] NVARCHAR(500) NOT NULL,
    [isRead] BIT NOT NULL CONSTRAINT [Notification_isRead_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notification_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Notification_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
