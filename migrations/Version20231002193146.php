<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231002193146 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE shop ADD retailer_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE shop ADD CONSTRAINT FK_AC6A4CA223F5ED09 FOREIGN KEY (retailer_id) REFERENCES retailer (id)');
        $this->addSql('CREATE INDEX IDX_AC6A4CA223F5ED09 ON shop (retailer_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE shop DROP FOREIGN KEY FK_AC6A4CA223F5ED09');
        $this->addSql('DROP INDEX IDX_AC6A4CA223F5ED09 ON shop');
        $this->addSql('ALTER TABLE shop DROP retailer_id');
    }
}
