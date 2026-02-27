<?php

namespace App\Application\BannerPlacement\Command\UpdateBannerCoordinates;

use App\Application\Contract\CommandInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class UpdateBannerCoordinatesCommand implements CommandInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $shopId;

    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $id;

    #[Assert\NotNull]
    public float $x_coordinate;

    #[Assert\NotNull]
    public float $y_coordinate;
}
