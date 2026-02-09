<?php

namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class ProductCollectionItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: ProductCollection::class, inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: false)]
    private ?ProductCollection $collection = null;

    #[ORM\ManyToOne(targetEntity: Commodity::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Commodity $commodity = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCollection(): ?ProductCollection
    {
        return $this->collection;
    }

    public function setCollection(?ProductCollection $collection): self
    {
        $this->collection = $collection;
        return $this;
    }

    public function getCommodity(): ?Commodity
    {
        return $this->commodity;
    }

    public function setCommodity(?Commodity $commodity): self
    {
        $this->commodity = $commodity;
        return $this;
    }

    public function __toString(): string
    {
        return $this->commodity?->getTitle() ?? '';
    }
}
