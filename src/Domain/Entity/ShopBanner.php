<?php

namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'shop_banner')]
class ShopBanner
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Shop::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Shop $shop = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $title = '';

    #[ORM\Column(type: 'string', length: 1024, nullable: true)]
    private ?string $imageUrl = null;

    #[ORM\Column(name: 'image_file', type: 'string', length: 255, nullable: true)]
    private ?string $imageFile = null;

    #[ORM\Column(type: 'string', length: 1024, nullable: true)]
    private ?string $targetUrl = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $x_coordinate = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $y_coordinate = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $active = true;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $sortOrder = 0;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getShop(): ?Shop
    {
        return $this->shop;
    }

    public function setShop(?Shop $shop): self
    {
        $this->shop = $shop;

        return $this;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }

    public function setImageUrl(?string $imageUrl): self
    {
        $this->imageUrl = $imageUrl;

        return $this;
    }

    public function getImageFile(): ?string
    {
        return $this->imageFile;
    }

    public function setImageFile(?string $imageFile): self
    {
        $this->imageFile = $imageFile;

        return $this;
    }

    public function getResolvedImageUrl(): ?string
    {
        if ($this->imageFile) {
            return '/img/' . ltrim($this->imageFile, '/');
        }

        return $this->imageUrl;
    }

    public function getTargetUrl(): ?string
    {
        return $this->targetUrl;
    }

    public function setTargetUrl(?string $targetUrl): self
    {
        $this->targetUrl = $targetUrl;

        return $this;
    }

    public function getXCoordinate(): ?float
    {
        return $this->x_coordinate;
    }

    public function setXCoordinate(?float $x_coordinate): self
    {
        $this->x_coordinate = $x_coordinate;

        return $this;
    }

    public function getYCoordinate(): ?float
    {
        return $this->y_coordinate;
    }

    public function setYCoordinate(?float $y_coordinate): self
    {
        $this->y_coordinate = $y_coordinate;

        return $this;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function setActive(bool $active): self
    {
        $this->active = $active;

        return $this;
    }

    public function getSortOrder(): int
    {
        return $this->sortOrder;
    }

    public function setSortOrder(int $sortOrder): self
    {
        $this->sortOrder = $sortOrder;

        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function __toString(): string
    {
        return sprintf('%s (%s)', $this->title, $this->shop?->getTitle() ?? 'N/A');
    }
}
