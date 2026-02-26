<?php

namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'user_activity')]
#[ORM\Index(columns: ['shop_id'], name: 'idx_activity_shop')]
#[ORM\Index(columns: ['created_at'], name: 'idx_activity_created')]
class UserActivity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Shop::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Shop $shop;

    #[ORM\Column(name: '`query`', type: 'text', nullable: true)]
    private ?string $query = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $routeCategories = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $routeDistanceMeters = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $routeTimeMinutes = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, nullable: true)]
    private ?string $routeCost = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $purchasedItems = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;
        return $this;
    }

    public function getShop(): Shop
    {
        return $this->shop;
    }

    public function setShop(Shop $shop): self
    {
        $this->shop = $shop;
        return $this;
    }

    public function getQuery(): ?string
    {
        return $this->query;
    }

    public function setQuery(?string $query): self
    {
        $this->query = $query;
        return $this;
    }

    public function getRouteCategories(): ?array
    {
        return $this->routeCategories;
    }

    public function setRouteCategories(?array $routeCategories): self
    {
        $this->routeCategories = $routeCategories;
        return $this;
    }

    public function getRouteDistanceMeters(): ?int
    {
        return $this->routeDistanceMeters;
    }

    public function setRouteDistanceMeters(?int $routeDistanceMeters): self
    {
        $this->routeDistanceMeters = $routeDistanceMeters;
        return $this;
    }

    public function getRouteTimeMinutes(): ?int
    {
        return $this->routeTimeMinutes;
    }

    public function setRouteTimeMinutes(?int $routeTimeMinutes): self
    {
        $this->routeTimeMinutes = $routeTimeMinutes;
        return $this;
    }

    public function getRouteCost(): ?string
    {
        return $this->routeCost;
    }

    public function setRouteCost(?string $routeCost): self
    {
        $this->routeCost = $routeCost;
        return $this;
    }

    public function getPurchasedItems(): ?array
    {
        return $this->purchasedItems;
    }

    public function setPurchasedItems(?array $purchasedItems): self
    {
        $this->purchasedItems = $purchasedItems;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function hasRoute(): bool
    {
        return $this->routeDistanceMeters !== null;
    }

    public function getRouteCategoriesDisplay(): string
    {
        if (!$this->routeCategories || count($this->routeCategories) === 0) {
            return '-';
        }

        $labels = array_values(array_filter(array_map(function ($category): string {
            if (is_string($category)) {
                return trim($category);
            }

            if (is_array($category)) {
                $name = $category['name'] ?? $category['title'] ?? null;

                if (is_string($name)) {
                    return trim($name);
                }
            }

            return '';
        }, $this->routeCategories)));

        if (count($labels) === 0) {
            return '-';
        }

        return implode(' → ', $labels);
    }

    public function __toString(): string
    {
        $label = $this->query ? mb_substr($this->query, 0, 30) : 'Activity';
        return sprintf('%s #%d (%s)', $label, $this->id ?? 0, $this->createdAt->format('d.m.Y H:i'));
    }
}
