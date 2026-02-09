<?php

namespace App\Domain\Factory;

use App\Application\Tracking\Command\TrackSearch\TrackSearchCommand;
use App\Domain\Entity\Shop;
use App\Domain\Entity\User;
use App\Domain\Entity\UserActivity;

class UserActivityFactory
{
    public function createFromSearchCommand(TrackSearchCommand $command, Shop $shop, ?User $user): UserActivity
    {
        $activity = new UserActivity();
        $activity->setShop($shop);
        $activity->setQuery($command->query);

        if ($user) {
            $activity->setUser($user);
        }

        return $activity;
    }
}
