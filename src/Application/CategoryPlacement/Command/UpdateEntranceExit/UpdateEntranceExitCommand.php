<?php

namespace App\Application\CategoryPlacement\Command\UpdateEntranceExit;

use App\Application\Contract\CommandInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class UpdateEntranceExitCommand implements CommandInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $shopId;

    public ?float $entranceX = null;
    public ?float $entranceY = null;
    public ?float $exitX = null;
    public ?float $exitY = null;
}
