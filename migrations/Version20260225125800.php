<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add ai_context field to shop table for storing shop-specific AI assistant context
 */
final class Version20260225125800 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add ai_context column to shop table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE shop ADD ai_context LONGTEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE shop DROP ai_context');
    }
}
