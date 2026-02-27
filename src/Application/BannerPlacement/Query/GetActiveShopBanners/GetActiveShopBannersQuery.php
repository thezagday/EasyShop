<?php

namespace App\Application\BannerPlacement\Query\GetActiveShopBanners;

use App\Application\Contract\QueryInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class GetActiveShopBannersQuery implements QueryInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $shopId;
}
