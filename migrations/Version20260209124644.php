<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260209124644 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX idx_activity_type ON user_activity');
        $this->addSql('ALTER TABLE user_activity DROP type, DROP session_id, DROP session_duration_seconds, DROP steps_count, DROP estimated_spent, DROP metadata');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_activity ADD type VARCHAR(20) NOT NULL, ADD session_id VARCHAR(255) DEFAULT NULL, ADD session_duration_seconds INT DEFAULT NULL, ADD steps_count INT DEFAULT NULL, ADD estimated_spent NUMERIC(10, 2) DEFAULT NULL, ADD metadata JSON DEFAULT NULL');
        $this->addSql('CREATE INDEX idx_activity_type ON user_activity (type)');
    }
}
