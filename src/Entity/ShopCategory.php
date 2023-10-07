<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\ShopCategoryRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ShopCategoryRepository::class)]
#[ApiResource(normalizationContext: ['groups' => ['shop_category']])] // https://github.com/dunglas/vulcain
#[ApiFilter(SearchFilter::class, properties: ['shop' => 'exact', 'category' => 'exact'])]
class ShopCategory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['shop_category'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'shopCategories')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['shop_category'])]
    private ?Shop $shop = null;

    #[ORM\ManyToOne(inversedBy: 'shops')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['shop_category'])]
    private ?Category $category = null;

    #[ORM\Column]
    #[Groups(['shop_category'])]
    private ?float $x_coordinate = null;

    #[ORM\Column]
    #[Groups(['shop_category'])]
    private ?float $y_coordinate = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getShop(): ?Shop
    {
        return $this->shop;
    }

    public function setShop(?Shop $shop): static
    {
        $this->shop = $shop;

        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getXCoordinate(): ?float
    {
        return $this->x_coordinate;
    }

    public function setXCoordinate(float $x_coordinate): static
    {
        $this->x_coordinate = $x_coordinate;

        return $this;
    }

    public function getYCoordinate(): ?float
    {
        return $this->y_coordinate;
    }

    public function setYCoordinate(float $y_coordinate): static
    {
        $this->y_coordinate = $y_coordinate;

        return $this;
    }
}
