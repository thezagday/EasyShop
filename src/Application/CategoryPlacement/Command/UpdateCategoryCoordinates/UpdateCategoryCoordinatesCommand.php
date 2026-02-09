<?php

namespace App\Application\CategoryPlacement\Command\UpdateCategoryCoordinates;

use App\Application\Contract\CommandInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class UpdateCategoryCoordinatesCommand implements CommandInterface
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
