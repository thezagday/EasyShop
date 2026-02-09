<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260209144841 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE product_collection_commodity (product_collection_id INT NOT NULL, commodity_id INT NOT NULL, INDEX IDX_66FD2C958BA44A0F (product_collection_id), INDEX IDX_66FD2C95B4ACC212 (commodity_id), PRIMARY KEY(product_collection_id, commodity_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE product_collection_commodity ADD CONSTRAINT FK_66FD2C958BA44A0F FOREIGN KEY (product_collection_id) REFERENCES product_collection (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE product_collection_commodity ADD CONSTRAINT FK_66FD2C95B4ACC212 FOREIGN KEY (commodity_id) REFERENCES commodity (id) ON DELETE CASCADE');
        $this->addSql('INSERT IGNORE INTO product_collection_commodity (product_collection_id, commodity_id) SELECT collection_id, commodity_id FROM product_collection_item');
        $this->addSql('DROP TABLE product_collection_item');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE product_collection_commodity DROP FOREIGN KEY FK_66FD2C958BA44A0F');
        $this->addSql('ALTER TABLE product_collection_commodity DROP FOREIGN KEY FK_66FD2C95B4ACC212');
        $this->addSql('DROP TABLE product_collection_commodity');
    }
}
