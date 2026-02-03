<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Domain\Entity\Category;
use App\Domain\Entity\Commodity;
use App\Domain\Entity\Retailer;
use App\Domain\Entity\Shop;
use App\Domain\Entity\ShopCategory;
use App\Domain\Entity\User;
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminDashboard;
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
    #[Route('/admin', name: 'admin', host: '%admin_host%')]
    public function index(): Response
    {
        $adminUrlGenerator = $this->container->get(AdminUrlGenerator::class);
        return $this->redirect($adminUrlGenerator->setController(ShopCrudController::class)->generateUrl());
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('EasyShop Admin');
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
        
        yield MenuItem::section('User Management');
        yield MenuItem::linkToCrud('Users', 'fas fa-users', User::class);
        
        yield MenuItem::section('Links');
        $adminUrl = 'http://' . $this->getParameter('admin_host') . '/';
        yield MenuItem::linkToUrl('Back to Website', 'fas fa-arrow-left', $adminUrl);
    }
}
