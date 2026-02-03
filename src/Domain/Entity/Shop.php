<?php

namespace App\Domain\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Ignore;

#[ORM\Entity]
#[ApiResource]
#[ApiFilter(SearchFilter::class, properties: ['title' => 'ipartial'])]
class Shop
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $title;

    #[ORM\Column(length: 255)]
    private string $avatar;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $mapImage = null;

    #[ORM\ManyToOne(targetEntity: Retailer::class)]
    #[ORM\JoinColumn(name: 'retailer_id', referencedColumnName: 'id')]
    #[Ignore]
    private Retailer|null $retailer = null;

    #[ORM\OneToMany(mappedBy: 'shop', targetEntity: ShopCategory::class, orphanRemoval: true)]
    #[Ignore]
    private Collection $shopCategories;

    #[ORM\OneToMany(mappedBy: 'shop', targetEntity: Obstacle::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Ignore]
    private Collection $obstacles;

    public function __construct()
    {
        $this->shopCategories = new ArrayCollection();
        $this->obstacles = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getAvatar(): string
    {
        return $this->avatar;
    }

    public function setAvatar(string $avatar): self
    {
        $this->avatar = $avatar;

        return $this;
    }

    public function getMapImage(): ?string
    {
        return $this->mapImage;
    }

    public function setMapImage(?string $mapImage): self
    {
        $this->mapImage = $mapImage;

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

    public function getShopCategories(): Collection
    {
        return $this->shopCategories;
    }

    public function addShopCategory(ShopCategory $shopCategory): self
    {
        if (!$this->shopCategories->contains($shopCategory)) {
            $this->shopCategories->add($shopCategory);
            $shopCategory->setShop($this);
        }

        return $this;
    }

    public function removeShopCategory(ShopCategory $shopCategory): self
    {
        if ($this->shopCategories->removeElement($shopCategory)) {
            // set the owning side to null (unless already changed)
            if ($shopCategory->getShop() === $this) {
                $shopCategory->setShop(null);
            }
        }

        return $this;
    }

    public function getObstacles(): Collection
    {
        return $this->obstacles;
    }

    public function addObstacle(Obstacle $obstacle): self
    {
        if (!$this->obstacles->contains($obstacle)) {
            $this->obstacles->add($obstacle);
            $obstacle->setShop($this);
        }

        return $this;
    }

    public function removeObstacle(Obstacle $obstacle): self
    {
        if ($this->obstacles->removeElement($obstacle)) {
            if ($obstacle->getShop() === $this) {
                $obstacle->setShop(null);
            }
        }

        return $this;
    }

    public function __toString(): string
    {
        return $this->title ?? '';
    }
}
