-- ============================================================================
-- Migration 4: ALTER COLUMNS AND ADD CONSTRAINTS
-- Tip operacije: ALTER COLUMN, ADD CHECK CONSTRAINT
-- Izmena postojećih kolona i dodavanje ograničenja
-- ============================================================================

BEGIN TRY

BEGIN TRAN;

-- ============================================================================
-- ALTER COLUMN: Notification.message
-- Povećavamo maksimalnu dužinu poruke sa 500 na 1000 karaktera
-- ============================================================================
ALTER TABLE [dbo].[Notification] ALTER COLUMN [message] NVARCHAR(1000) NOT NULL;

-- ============================================================================
-- ALTER COLUMN: Task.title
-- Povećavamo maksimalnu dužinu naslova sa 512 na 1024 karaktera
-- ============================================================================
ALTER TABLE [dbo].[Task] ALTER COLUMN [title] NVARCHAR(1024) NOT NULL;

-- ============================================================================
-- ADD CHECK CONSTRAINT: Task.priority
-- Ograničavamo vrednosti prioriteta na dozvoljene opcije
-- ============================================================================
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [Task_priority_check]
    CHECK ([priority] IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'));

-- ============================================================================
-- ADD CHECK CONSTRAINT: User.role
-- Ograničavamo vrednosti role na dozvoljene opcije
-- ============================================================================
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_role_check]
    CHECK ([role] IN ('ADMIN', 'MODERATOR', 'USER'));

-- ============================================================================
-- ADD CHECK CONSTRAINT: Notification.type
-- Ograničavamo tipove notifikacija na dozvoljene opcije
-- ============================================================================
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_type_check]
    CHECK ([type] IN ('TASK_ASSIGNED', 'TASK_UPDATED', 'TASK_COMPLETED',
                       'PROJECT_INVITE', 'MENTION', 'REMINDER', 'SYSTEM'));

-- ============================================================================
-- ADD CHECK CONSTRAINT: Project.color - format hex boje
-- Proveravamo da boja počinje sa # i ima 6 hex karaktera
-- ============================================================================
ALTER TABLE [dbo].[Project] ADD CONSTRAINT [Project_color_check]
    CHECK ([color] LIKE '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]');

-- ============================================================================
-- ADD CHECK CONSTRAINT: Column.color - format hex boje
-- ============================================================================
ALTER TABLE [dbo].[Column] ADD CONSTRAINT [Column_color_check]
    CHECK ([color] LIKE '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]');

-- ============================================================================
-- ADD CHECK CONSTRAINT: Label.color - format hex boje
-- ============================================================================
ALTER TABLE [dbo].[Label] ADD CONSTRAINT [Label_color_check]
    CHECK ([color] LIKE '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]');

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
