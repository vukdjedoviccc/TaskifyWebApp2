-- ============================================================================
-- Migration 3: ADD FOREIGN KEYS AND INDEXES
-- Tip operacije: ADD FOREIGN KEY, CREATE INDEX
-- Dodavanje referencijalnog integriteta i optimizacija upita
-- ============================================================================

BEGIN TRY

BEGIN TRAN;

-- ============================================================================
-- FOREIGN KEYS - Referencijalni integritet
-- ============================================================================

-- Project.ownerId -> User.id
ALTER TABLE [dbo].[Project] ADD CONSTRAINT [Project_ownerId_fkey]
    FOREIGN KEY ([ownerId]) REFERENCES [dbo].[User]([id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Board.projectId -> Project.id (CASCADE DELETE)
ALTER TABLE [dbo].[Board] ADD CONSTRAINT [Board_projectId_fkey]
    FOREIGN KEY ([projectId]) REFERENCES [dbo].[Project]([id])
    ON DELETE CASCADE ON UPDATE NO ACTION;

-- Column.boardId -> Board.id (CASCADE DELETE)
ALTER TABLE [dbo].[Column] ADD CONSTRAINT [Column_boardId_fkey]
    FOREIGN KEY ([boardId]) REFERENCES [dbo].[Board]([id])
    ON DELETE CASCADE ON UPDATE NO ACTION;

-- Task.columnId -> Column.id (CASCADE DELETE)
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [Task_columnId_fkey]
    FOREIGN KEY ([columnId]) REFERENCES [dbo].[Column]([id])
    ON DELETE CASCADE ON UPDATE NO ACTION;

-- Task.createdById -> User.id
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [Task_createdById_fkey]
    FOREIGN KEY ([createdById]) REFERENCES [dbo].[User]([id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Task.assigneeId -> User.id (NULLABLE)
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [Task_assigneeId_fkey]
    FOREIGN KEY ([assigneeId]) REFERENCES [dbo].[User]([id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Task.labelId -> Label.id (NULLABLE)
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [Task_labelId_fkey]
    FOREIGN KEY ([labelId]) REFERENCES [dbo].[Label]([id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Label.projectId -> Project.id (CASCADE DELETE)
ALTER TABLE [dbo].[Label] ADD CONSTRAINT [Label_projectId_fkey]
    FOREIGN KEY ([projectId]) REFERENCES [dbo].[Project]([id])
    ON DELETE CASCADE ON UPDATE NO ACTION;

-- Notification.userId -> User.id (CASCADE DELETE)
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_userId_fkey]
    FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id])
    ON DELETE CASCADE ON UPDATE NO ACTION;

-- ============================================================================
-- INDEXES - Optimizacija upita
-- ============================================================================

-- Index za pretragu projekata po vlasniku
CREATE NONCLUSTERED INDEX [Project_ownerId_idx] ON [dbo].[Project]([ownerId]);

-- Index za pretragu board-ova po projektu
CREATE NONCLUSTERED INDEX [Board_projectId_idx] ON [dbo].[Board]([projectId]);

-- Index za pretragu kolona po board-u
CREATE NONCLUSTERED INDEX [Column_boardId_idx] ON [dbo].[Column]([boardId]);

-- Index za pretragu taskova po koloni
CREATE NONCLUSTERED INDEX [Task_columnId_idx] ON [dbo].[Task]([columnId]);

-- Index za pretragu taskova po kreatoru
CREATE NONCLUSTERED INDEX [Task_createdById_idx] ON [dbo].[Task]([createdById]);

-- Index za pretragu taskova po assignee-u
CREATE NONCLUSTERED INDEX [Task_assigneeId_idx] ON [dbo].[Task]([assigneeId]);

-- Index za pretragu taskova po labeli
CREATE NONCLUSTERED INDEX [Task_labelId_idx] ON [dbo].[Task]([labelId]);

-- Index za pretragu labela po projektu
CREATE NONCLUSTERED INDEX [Label_projectId_idx] ON [dbo].[Label]([projectId]);

-- Index za pretragu notifikacija po korisniku
CREATE NONCLUSTERED INDEX [Notification_userId_idx] ON [dbo].[Notification]([userId]);

-- Unique constraint za Label (projectId + name)
ALTER TABLE [dbo].[Label] ADD CONSTRAINT [Label_projectId_name_key]
    UNIQUE NONCLUSTERED ([projectId], [name]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
