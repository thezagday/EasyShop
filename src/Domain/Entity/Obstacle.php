<?php

namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'obstacles')]
class Obstacle
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['obstacle:read', 'shop:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Shop::class, inversedBy: 'obstacles')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Shop $shop = null;

    #[ORM\Column(type: 'integer')]
    #[Groups(['obstacle:read', 'obstacle:write', 'shop:read'])]
    private int $x;

    #[ORM\Column(type: 'integer')]
    #[Groups(['obstacle:read', 'obstacle:write', 'shop:read'])]
    private int $y;

    #[ORM\Column(type: 'integer')]
    #[Groups(['obstacle:read', 'obstacle:write', 'shop:read'])]
    private int $width;

    #[ORM\Column(type: 'integer')]
    #[Groups(['obstacle:read', 'obstacle:write', 'shop:read'])]
    private int $height;

    #[ORM\Column(type: 'string', length: 50)]
    #[Groups(['obstacle:read', 'obstacle:write', 'shop:read'])]
    private string $type = 'shelf'; // shelf, wall, counter, checkout

    #[ORM\Column(type: 'datetime')]
    #[Groups(['obstacle:read'])]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
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

    public function getX(): int
    {
        return $this->x;
    }

    public function setX(int $x): self
    {
        $this->x = $x;
        return $this;
    }

    public function getY(): int
    {
        return $this->y;
    }

    public function setY(int $y): self
    {
        $this->y = $y;
        return $this;
    }

    public function getWidth(): int
    {
        return $this->width;
    }

    public function setWidth(int $width): self
    {
        $this->width = $width;
        return $this;
    }

    public function getHeight(): int
    {
        return $this->height;
    }

    public function setHeight(int $height): self
    {
        $this->height = $height;
        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }
}
