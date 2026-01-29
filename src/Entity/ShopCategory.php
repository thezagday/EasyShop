<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\ShopCategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ShopCategoryRepository::class)]
#[ApiResource(normalizationContext: ['groups' => ['shopCategory:read']])] // https://github.com/dunglas/vulcain
#[ApiFilter(SearchFilter::class, properties: ['shop' => 'exact'])]
class ShopCategory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['shopCategory:read', 'commodity:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'shopCategories')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['shopCategory:read'])]
    private ?Shop $shop = null;

    #[ORM\ManyToOne(inversedBy: 'shops')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['shopCategory:read', 'commodity:read'])]
    private ?Category $category = null;

    #[ORM\Column]
    #[Groups(['shopCategory:read', 'commodity:read'])]
    private ?float $x_coordinate = null;

    #[ORM\Column]
    #[Groups(['shopCategory:read', 'commodity:read'])]
    private ?float $y_coordinate = null;

    #[ORM\ManyToMany(targetEntity: Commodity::class, mappedBy: 'shopCategories')]
    #[Groups(['shopCategory:read'])]
    private Collection $commodities;

    public function __construct()
    {
        $this->commodities = new ArrayCollection();
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

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): self
    {
        $this->category = $category;

        return $this;
    }

    public function getXCoordinate(): ?float
    {
        return $this->x_coordinate;
    }

    public function setXCoordinate(float $x_coordinate): self
    {
        $this->x_coordinate = $x_coordinate;

        return $this;
    }

    public function getYCoordinate(): ?float
    {
        return $this->y_coordinate;
    }

    public function setYCoordinate(float $y_coordinate): self
    {
        $this->y_coordinate = $y_coordinate;

        return $this;
    }

    public function getCommodities(): Collection
    {
        return $this->commodities;
    }

    public function setCommodities(Collection $commodities): self
    {
        $this->commodities = $commodities;

        return $this;
    }

    public function addCommodity(Commodity $commodity): self
    {
        if (!$this->commodities->contains($commodity)) {
            $this->commodities->add($commodity);
        }

        return $this;
    }

    public function removeCommodity(Commodity $commodity): self
    {
        $this->commodities->removeElement($commodity);

        return $this;
    }

    public function __toString(): string
    {
        return sprintf('%s (%s)', $this->category?->getTitle() ?? 'N/A', $this->shop?->getTitle() ?? 'N/A');
    }
}
