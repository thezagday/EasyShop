<?php

namespace App\Entity;

use App\Repository\CategoryRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\JoinColumn;
use Doctrine\ORM\Mapping\ManyToOne;

#[ORM\Entity(repositoryClass: CategoryRepository::class)]
class Category
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ManyToOne(targetEntity: Retailer::class)]
    #[JoinColumn(name: 'retailer_id', referencedColumnName: 'id')]
    private Retailer|null $retailer = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getRetailer(): ?Retailer
    {
        return $this->retailer;
    }

    public function setRetailer(?Retailer $retailer): self
    {
        $this->retailer = $retailer;

        return $this;
    }
}
