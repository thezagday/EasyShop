<?php

namespace App\Domain\Entity;

use App\Domain\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[UniqueEntity(fields: ['email'], message: 'There is already an account with this email')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $userContext = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: UserActivity::class)]
    private Collection $activities;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: ProductCollection::class)]
    private Collection $collections;

    public function __construct()
    {
        $this->activities = new ArrayCollection();
        $this->collections = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function __toString(): string
    {
        return $this->email ?? '';
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @return list<string>
     */
    public function getStoredRoles(): array
    {
        return $this->roles;
    }

    public function hasStoredRole(string $role): bool
    {
        return in_array($role, $this->roles, true);
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getUserContext(): ?string
    {
        return $this->userContext;
    }

    public function setUserContext(?string $userContext): static
    {
        $this->userContext = $userContext;
        return $this;
    }

    public function getActivities(): Collection
    {
        return $this->activities;
    }

    public function getCollections(): Collection
    {
        return $this->collections;
    }

    public function getCollectionsCount(): int
    {
        return $this->collections->count();
    }

    public function getStatsTotalRoutes(): int
    {
        $totalRoutes = 0;

        foreach ($this->activities as $activity) {
            if ($activity->hasRoute()) {
                $totalRoutes++;
            }
        }

        return $totalRoutes;
    }

    public function getStatsTotalDistanceMeters(): int
    {
        $totalDistance = 0;

        foreach ($this->activities as $activity) {
            if ($activity->hasRoute()) {
                $totalDistance += $activity->getRouteDistanceMeters() ?? 0;
            }
        }

        return $totalDistance;
    }

    public function getStatsTotalTimeMinutes(): int
    {
        $totalTime = 0;

        foreach ($this->activities as $activity) {
            if ($activity->hasRoute()) {
                $totalTime += $activity->getRouteTimeMinutes() ?? 0;
            }
        }

        return $totalTime;
    }

    public function getStatsTotalCostDisplay(): string
    {
        $totalCost = 0.0;

        foreach ($this->activities as $activity) {
            if (!$activity->hasRoute()) {
                continue;
            }

            $cost = $activity->getRouteCost();
            if ($cost !== null) {
                $totalCost += (float) $cost;
            }
        }

        return number_format($totalCost, 2, '.', '');
    }

    /**
     * Ensure the session doesn't contain actual password hashes by CRC32C-hashing them, as supported since Symfony 7.3.
     */
    public function __serialize(): array
    {
        $data = (array) $this;
        $data["\0".self::class."\0password"] = hash('crc32c', $this->password);

        return $data;
    }

    #[\Deprecated]
    public function eraseCredentials(): void
    {
        // @deprecated, to be removed when upgrading to Symfony 8
    }
}
