<?php

namespace App\Application\Tracking\Command\TrackSearch;

use App\Application\Contract\CommandInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class TrackSearchCommand implements CommandInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $shopId;

    #[Assert\NotBlank]
    public string $query;
}
