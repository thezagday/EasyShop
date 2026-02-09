<?php

namespace App\Domain\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use App\Domain\Repository\CommodityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ApiResource(
    normalizationContext: ['groups' => ['commodity:read']]
)]
#[ApiFilter(SearchFilter::class, properties: ['title' => 'partial', 'shopCategories.shop' => 'exact'])]
class Commodity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['shopCategory:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['shopCategory:read', 'commodity:read'])]
    private ?string $title = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, nullable: true)]
    #[Groups(['shopCategory:read', 'commodity:read'])]
    private ?string $price = null;

    #[ORM\ManyToMany(targetEntity: ShopCategory::class, inversedBy: 'commodities')]
    #[ORM\JoinTable(name: 'commodities_shop_categories')]
    #[Groups(['commodity:read'])]
    private Collection $shopCategories;

    public function __construct() {
        $this->shopCategories = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getPrice(): ?string
    {
        return $this->price;
    }

    public function setPrice(?string $price): self
    {
        $this->price = $price;

        return $this;
    }

    public function getShopCategories(): Collection
    {
        return $this->shopCategories;
    }

    public function setShopCategories(Collection $shopCategories): self
    {
        $this->shopCategories = $shopCategories;

        return $this;
    }

    public function addShopCategory(ShopCategory $shopCategory): self
    {
        if (!$this->shopCategories->contains($shopCategory)) {
            $this->shopCategories->add($shopCategory);
            $shopCategory->addCommodity($this);
        }

        return $this;
    }

    public function removeShopCategory(ShopCategory $shopCategory): self
    {
        $this->shopCategories->removeElement($shopCategory);

        return $this;
    }

    public function __toString(): string
    {
        return $this->title ?? '';
    }
}
