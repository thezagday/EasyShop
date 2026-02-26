<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add user features: user_context, user collections, and cost tracking
 */
final class Version20260225130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add user_context to user, user_id to product_collection, and cost tracking to user_activity';
    }

    public function up(Schema $schema): void
    {
        // Add user_context to user table
        $this->addSql('ALTER TABLE user ADD user_context LONGTEXT DEFAULT NULL');

        // Add user_id to product_collection table
        $this->addSql('ALTER TABLE product_collection ADD user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE product_collection ADD CONSTRAINT FK_F92E371AA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_F92E371AA76ED395 ON product_collection (user_id)');

        // Add cost tracking fields to user_activity table
        $this->addSql('ALTER TABLE user_activity ADD route_cost NUMERIC(10, 2) DEFAULT NULL');
        $this->addSql('ALTER TABLE user_activity ADD purchased_items JSON DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // Remove user_context from user table
        $this->addSql('ALTER TABLE user DROP user_context');

        // Remove user_id from product_collection table
        $this->addSql('ALTER TABLE product_collection DROP FOREIGN KEY FK_F92E371AA76ED395');
        $this->addSql('DROP INDEX IDX_F92E371AA76ED395 ON product_collection');
        $this->addSql('ALTER TABLE product_collection DROP user_id');

        // Remove cost tracking fields from user_activity table
        $this->addSql('ALTER TABLE user_activity DROP route_cost');
        $this->addSql('ALTER TABLE user_activity DROP purchased_items');
    }
}
