<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250201182514 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE commodities_shop_categories (commodity_id INT NOT NULL, shop_category_id INT NOT NULL, INDEX IDX_8D1ADE7BB4ACC212 (commodity_id), INDEX IDX_8D1ADE7BC0316BF2 (shop_category_id), PRIMARY KEY(commodity_id, shop_category_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE commodities_shop_categories ADD CONSTRAINT FK_8D1ADE7BB4ACC212 FOREIGN KEY (commodity_id) REFERENCES commodity (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE commodities_shop_categories ADD CONSTRAINT FK_8D1ADE7BC0316BF2 FOREIGN KEY (shop_category_id) REFERENCES shop_category (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE commodities_shop_categories DROP FOREIGN KEY FK_8D1ADE7BB4ACC212');
        $this->addSql('ALTER TABLE commodities_shop_categories DROP FOREIGN KEY FK_8D1ADE7BC0316BF2');
        $this->addSql('DROP TABLE commodities_shop_categories');
    }
}
