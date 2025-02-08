<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\CommodityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CommodityRepository::class)]
#[ApiResource]
class Commodity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['shopCategory:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['shopCategory:read'])]
    private ?string $title = null;

    #[ORM\ManyToMany(targetEntity: ShopCategory::class, inversedBy: 'commodities')]
    #[ORM\JoinTable(name: 'commodities_shop_categories')]
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
}
