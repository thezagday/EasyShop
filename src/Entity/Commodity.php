<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\CommodityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CommodityRepository::class)]
#[ApiResource(normalizationContext: ['groups' => ['commodity:read']], paginationEnabled: false)]
#[ApiFilter(SearchFilter::class, properties: ['title' => 'ipartial'])]
class Commodity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['commodity:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['commodity:read'])]
    private ?string $title = null;

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
