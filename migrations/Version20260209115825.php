<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260209115825 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_activity (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, shop_id INT NOT NULL, type VARCHAR(20) NOT NULL, session_id VARCHAR(255) DEFAULT NULL, query LONGTEXT DEFAULT NULL, route_categories JSON DEFAULT NULL, route_distance_meters INT DEFAULT NULL, route_time_minutes INT DEFAULT NULL, session_duration_seconds INT DEFAULT NULL, steps_count INT DEFAULT NULL, estimated_spent NUMERIC(10, 2) DEFAULT NULL, metadata JSON DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_4CF9ED5AA76ED395 (user_id), INDEX idx_activity_type (type), INDEX idx_activity_shop (shop_id), INDEX idx_activity_created (created_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE user_activity ADD CONSTRAINT FK_4CF9ED5AA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE user_activity ADD CONSTRAINT FK_4CF9ED5A4D16C4DD FOREIGN KEY (shop_id) REFERENCES shop (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE commodity ADD price NUMERIC(10, 2) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_activity DROP FOREIGN KEY FK_4CF9ED5AA76ED395');
        $this->addSql('ALTER TABLE user_activity DROP FOREIGN KEY FK_4CF9ED5A4D16C4DD');
        $this->addSql('DROP TABLE user_activity');
        $this->addSql('ALTER TABLE commodity DROP price');
    }
}
