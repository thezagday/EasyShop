<?php

namespace App\Entity;

use App\Repository\CategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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

    #[ORM\OneToMany(mappedBy: 'category', targetEntity: ShopCategory::class, orphanRemoval: true)]
    private Collection $shops;

    public function __construct()
    {
        $this->shops = new ArrayCollection();
    }

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

    /**
     * @return Collection<int, ShopCategory>
     */
    public function getShops(): Collection
    {
        return $this->shops;
    }

    public function addShop(ShopCategory $shop): static
    {
        if (!$this->shops->contains($shop)) {
            $this->shops->add($shop);
            $shop->setCategory($this);
        }

        return $this;
    }

    public function removeShop(ShopCategory $shop): static
    {
        if ($this->shops->removeElement($shop)) {
            // set the owning side to null (unless already changed)
            if ($shop->getCategory() === $this) {
                $shop->setCategory(null);
            }
        }

        return $this;
    }
}
