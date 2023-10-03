<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231003185033 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE shop_category (id INT AUTO_INCREMENT NOT NULL, shop_id INT NOT NULL, category_id INT NOT NULL, x_coordinate DOUBLE PRECISION NOT NULL, y_coordinate DOUBLE PRECISION NOT NULL, INDEX IDX_DDF4E3574D16C4DD (shop_id), INDEX IDX_DDF4E35712469DE2 (category_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE shop_category ADD CONSTRAINT FK_DDF4E3574D16C4DD FOREIGN KEY (shop_id) REFERENCES shop (id)');
        $this->addSql('ALTER TABLE shop_category ADD CONSTRAINT FK_DDF4E35712469DE2 FOREIGN KEY (category_id) REFERENCES category (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE shop_category DROP FOREIGN KEY FK_DDF4E3574D16C4DD');
        $this->addSql('ALTER TABLE shop_category DROP FOREIGN KEY FK_DDF4E35712469DE2');
        $this->addSql('DROP TABLE shop_category');
    }
}
