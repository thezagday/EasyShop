<?php

namespace App\Infrastructure\Persistence\DataFixtures;

use App\Domain\Entity\Category;
use App\Domain\Entity\Commodity;
use App\Domain\Entity\Retailer;
use App\Domain\Entity\Shop;
use App\Domain\Entity\ShopCategory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    private const CATEGORIES = [
        'Бакалея',
        'Сладкое',
        'Молочная продукция',
        'Мясные изделия',
        'Рыба',
        'Овощи и фрукты',
        'Напитки',
        'Замороженные продукты',
        'Бытовая химия',
        'Хлебобулочные изделия',
    ];

    private const COMMODITIES = [
        'Бакалея' => ['Рис', 'Макароны', 'Гречка', 'Сахар', 'Мука'],
        'Сладкое' => ['Шоколад', 'Печенье', 'Конфеты', 'Зефир', 'Вафли'],
        'Молочная продукция' => ['Молоко', 'Кефир', 'Творог', 'Сметана', 'Йогурт'],
        'Мясные изделия' => ['Говядина', 'Свинина', 'Курица', 'Колбаса', 'Сосиски'],
        'Рыба' => ['Лосось', 'Треска', 'Сельдь', 'Скумбрия', 'Креветки'],
        'Овощи и фрукты' => ['Яблоки', 'Бананы', 'Картофель', 'Лук', 'Морковь'],
        'Напитки' => ['Вода', 'Сок', 'Кола', 'Чай', 'Кофе'],
        'Замороженные продукты' => ['Пельмени', 'Пицца', 'Овощная смесь', 'Мороженое', 'Ягоды'],
        'Бытовая химия' => ['Мыло', 'Шампунь', 'Порошок', 'Гель для душа', 'Зубная паста'],
        'Хлебобулочные изделия' => ['Батон', 'Хлеб ржаной', 'Булочка', 'Лаваш', 'Пончик'],
    ];

    public function load(ObjectManager $manager): void
    {
        // 1. Retailers
        $retailerData = [
            'Корона' => [
                'avatar' => 'denisovskaja.jpg',
                'address' => 'ул. Денисовская, 8'
            ],
            'Green' => [
                'avatar' => 'chervenski.jpg',
                'address' => 'ул. Маяковского, 6'
            ]
        ];

        $retailers = [];
        foreach ($retailerData as $title => $data) {
            $retailer = new Retailer();
            $retailer->setTitle($title);
            $manager->persist($retailer);
            $retailers[$title] = [
                'entity' => $retailer,
                'avatar' => $data['avatar'],
                'address' => $data['address']
            ];
        }

        // 2. Shops
        $shops = [];
        foreach ($retailers as $title => $data) {
            $shop = new Shop();
            $shop->setTitle($title . ' - ' . $data['address']);
            $shop->setAvatar($data['avatar']);
            $shop->setMapImage('map.svg');
            $shop->setRetailer($data['entity']);
            $manager->persist($shop);
            $shops[] = $shop;
        }

        // 3. Categories, ShopCategories, and Commodities
        foreach ($retailers as $rTitle => $rData) {
            $retailer = $rData['entity'];
            
            // Find the shop for this retailer
            $targetShop = null;
            foreach ($shops as $shop) {
                if ($shop->getRetailer() === $retailer) {
                    $targetShop = $shop;
                    break;
                }
            }

            if (!$targetShop) continue;

            // Координаты для каждого магазина
            $coordinates = [
                'Корона' => [
                    'Бакалея' => [220, 680],
                    'Сладкое' => [1100, 160],
                    'Молочная продукция' => [220, 590],
                    'Мясные изделия' => [220, 780],
                    'Рыба' => [1000, 240],
                    'Овощи и фрукты' => [520, 350],
                    'Напитки' => [700, 480],
                    'Замороженные продукты' => [650, 800],
                    'Бытовая химия' => [1150, 450],
                    'Хлебобулочные изделия' => [650, 180],
                ],
                'Green' => [
                    'Бакалея' => [220, 680],
                    'Сладкое' => [1100, 160],
                    'Молочная продукция' => [220, 590],
                    'Мясные изделия' => [220, 780],
                    'Рыба' => [1000, 240],
                    'Овощи и фрукты' => [520, 350],
                    'Напитки' => [700, 480],
                    'Замороженные продукты' => [650, 800],
                    'Бытовая химия' => [1150, 450],
                    'Хлебобулочные изделия' => [650, 180],
                ],
            ];

            foreach (self::CATEGORIES as $index => $catTitle) {
                $category = new Category();
                $category->setTitle($catTitle);
                $category->setRetailer($retailer);
                $manager->persist($category);

                // Create ShopCategory
                $shopCategory = new ShopCategory();
                $shopCategory->setShop($targetShop);
                $shopCategory->setCategory($category);
                
                // Используем координаты из базы данных
                if (isset($coordinates[$rTitle][$catTitle])) {
                    $coords = $coordinates[$rTitle][$catTitle];
                    $shopCategory->setXCoordinate($coords[0]);
                    $shopCategory->setYCoordinate($coords[1]);
                } else {
                    // Fallback на центр карты если координаты не найдены
                    $shopCategory->setXCoordinate(50);
                    $shopCategory->setYCoordinate(50);
                }
                
                $manager->persist($shopCategory);

                // Create and link commodities
                if (isset(self::COMMODITIES[$catTitle])) {
                    foreach (self::COMMODITIES[$catTitle] as $commTitle) {
                        $commodity = new Commodity();
                        $commodity->setTitle($commTitle . ' (' . $rTitle . ')');
                        // Crucial: link to shopCategory (owning side is Commodity)
                        $commodity->addShopCategory($shopCategory);
                        $manager->persist($commodity);
                    }
                }
            }
        }

        $manager->flush();
    }
}
