<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\Category;
use App\Domain\Entity\Commodity;
use App\Domain\Entity\ProductCollection;
use App\Domain\Entity\Retailer;
use App\Domain\Entity\Shop;
use App\Domain\Entity\ShopCategory;
use App\Domain\Entity\User;
use App\Domain\Entity\UserActivity;
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminDashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Assets;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[AdminDashboard]
#[IsGranted('ROLE_ADMIN')]
class DashboardController extends AbstractDashboardController
{
    public function __construct(
        private AdminUrlGenerator $adminUrlGenerator
    ) {
    }

    #[Route('/admin', name: 'admin', host: '%admin_host%')]
    public function index(): Response
    {
        return $this->redirect(
            $this->adminUrlGenerator
                ->setController(ShopCrudController::class)
                ->generateUrl()
        );
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('EasyShop Управление');
    }

    public function configureAssets(): Assets
    {
        return Assets::new()
            ->addHtmlContentToHead('<link rel="icon" href="/img/icon.svg" type="image/svg+xml">')
            ->addHtmlContentToHead('<link rel="icon" href="/favicon.ico" sizes="any">');
    }

    public function configureUserMenu(\Symfony\Component\Security\Core\User\UserInterface $user): \EasyCorp\Bundle\EasyAdminBundle\Config\UserMenu
    {
        return parent::configureUserMenu($user);
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::linkToDashboard('Dashboard', 'fa fa-home');
        yield MenuItem::section('Shop Management');
        yield MenuItem::linkToCrud('Retailers', 'fas fa-building', Retailer::class);
        yield MenuItem::linkToCrud('Shops', 'fas fa-store', Shop::class);
        yield MenuItem::linkToCrud('Categories', 'fas fa-list', Category::class);
        yield MenuItem::linkToCrud('Shop Categories', 'fas fa-map-marker-alt', ShopCategory::class);
        yield MenuItem::linkToCrud('Commodities', 'fas fa-shopping-basket', Commodity::class);

        yield MenuItem::section('Collections');
        yield MenuItem::linkToCrud('Подборки', 'fas fa-gift', ProductCollection::class);

        yield MenuItem::section('User Management');
        yield MenuItem::linkToCrud('Users', 'fas fa-users', User::class);

        yield MenuItem::section('Analytics');
        yield MenuItem::linkToCrud('User Activity', 'fas fa-chart-line', UserActivity::class);

        yield MenuItem::section('Links');
        $adminUrl = $this->getParameter('app_scheme') . '://' . $this->getParameter('admin_host') . '/';
        yield MenuItem::linkToUrl('Back to Website', 'fas fa-arrow-left', $adminUrl);
    }
}
