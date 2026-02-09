<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260209133050 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE product_collection (id INT AUTO_INCREMENT NOT NULL, shop_id INT NOT NULL, title VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, emoji VARCHAR(10) DEFAULT NULL, active TINYINT(1) DEFAULT 1 NOT NULL, sort_order INT DEFAULT 0 NOT NULL, INDEX IDX_6F2A3A194D16C4DD (shop_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE product_collection_item (id INT AUTO_INCREMENT NOT NULL, collection_id INT NOT NULL, commodity_id INT NOT NULL, sort_order INT DEFAULT 0 NOT NULL, INDEX IDX_67E70C6D514956FD (collection_id), INDEX IDX_67E70C6DB4ACC212 (commodity_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE product_collection ADD CONSTRAINT FK_6F2A3A194D16C4DD FOREIGN KEY (shop_id) REFERENCES shop (id)');
        $this->addSql('ALTER TABLE product_collection_item ADD CONSTRAINT FK_67E70C6D514956FD FOREIGN KEY (collection_id) REFERENCES product_collection (id)');
        $this->addSql('ALTER TABLE product_collection_item ADD CONSTRAINT FK_67E70C6DB4ACC212 FOREIGN KEY (commodity_id) REFERENCES commodity (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE product_collection DROP FOREIGN KEY FK_6F2A3A194D16C4DD');
        $this->addSql('ALTER TABLE product_collection_item DROP FOREIGN KEY FK_67E70C6D514956FD');
        $this->addSql('ALTER TABLE product_collection_item DROP FOREIGN KEY FK_67E70C6DB4ACC212');
        $this->addSql('DROP TABLE product_collection');
        $this->addSql('DROP TABLE product_collection_item');
    }
}
