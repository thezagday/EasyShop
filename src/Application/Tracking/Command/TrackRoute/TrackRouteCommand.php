<?php

namespace App\Application\Tracking\Command\TrackRoute;

use App\Application\Contract\CommandInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class TrackRouteCommand implements CommandInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $id;

    public ?array $categories = null;

    public ?int $distanceMeters = null;

    public ?int $timeMinutes = null;
}
