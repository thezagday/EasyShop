<?php

namespace App\Application\BannerPlacement\Query\GetShopBanners;

use App\Application\Contract\QueryInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class GetShopBannersQuery implements QueryInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $shopId;
}
